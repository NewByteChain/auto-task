#!/bin/bash

# 配置文件路径（相对于脚本位置）
GITHUB_TOKEN_FILE="$(dirname "$0")/github_token.txt" # 存储 GITHUB_TOKEN 的 txt 文件
PROXIES_FILE="$(dirname "$0")/proxies.txt"  # 指定要检查/创建的 txt 文件名
PRIVATE_KEY_FILE="$(dirname "$0")/private_keys.txt"  # 指定要检查/创建的 txt 文件名

# GitHub 仓库地址
REPO_URL="https://github.com/NewByteChain/on-chain-inter.git"

# 本地代码目录（默认脚本同级目录下的 repo 文件夹）
LOCAL_DIR="$(dirname "$0")/code"
REPO_OWNER="NewByteChain"                           # 替换为 GitHub 仓库所有者
REPO_NAME="on-chain-inter"                          # 替换为 GitHub 仓库名称

# 加载配置文件（如果存在）
if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
else
  echo "Config file not found at $CONFIG_FILE. Using default settings."
  echo "Please create $CONFIG_FILE with REPO_URL, LOCAL_DIR, and GITHUB_TOKEN."
fi


if [ -z "$REPO_URL" ]; then
  echo "Error: REPO_URL is not set. Please set it in $CONFIG_FILE."
  exit 1
fi

# 确保 git 命令可用
if ! command -v git &> /dev/null; then
  echo "Error: git is not installed. Please install git."
  exit 1
fi

# 确保 npm 命令可用
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed. Please install Node.js and npm."
  exit 1
fi

# 检查并创建 github_token 文件
if [ ! -f "$GITHUB_TOKEN_FILE" ]; then
  echo "Text file $GITHUB_TOKEN_FILE does not exist. Creating an empty file..."
  touch "$GITHUB_TOKEN_FILE" || { echo "Error: Failed to create $GITHUB_TOKEN_FILE."; exit 1; }
  echo "Created empty $GITHUB_TOKEN_FILE."
else
  echo "Text file $GITHUB_TOKEN_FILE already exists."
  GITHUB_TOKEN=$(cat "$GITHUB_TOKEN_FILE" | tr -d '\n\r')  # 读取并去除换行符
fi

# 检查并创建 PRIVATE_KEY_FILE 文件
if [ ! -f "$PRIVATE_KEY_FILE" ]; then
  echo "Text file $PRIVATE_KEY_FILE does not exist. Creating an empty file..."
  touch "$PRIVATE_KEY_FILE" || { echo "Error: Failed to create $PRIVATE_KEY_FILE."; exit 1; }
  echo "Created empty $PRIVATE_KEY_FILE."
else
  echo "Text file $PRIVATE_KEY_FILE already exists."
fi

# 检查并创建 proxies 文件
if [ ! -f "$PROXIES_FILE" ]; then
  echo "Text file $PROXIES_FILE does not exist. Creating an empty file..."
  touch "$PROXIES_FILE" || { echo "Error: Failed to create $PROXIES_FILE."; exit 1; }
  echo "Created empty $PROXIES_FILE."
else
  echo "Text file $PROXIES_FILE already exists."
fi

# 检测操作系统并设置下载和解压工具
ARCHIVE_TYPE="tar.gz"


# 创建本地目录（如果不存在）
mkdir -p "$LOCAL_DIR"

# 使用 GitHub API 获取最新 release 信息
API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest"
echo "Fetching latest release from $API_URL..."

# 获取最新 release 的 tarball URL 和版本号
RELEASE_INFO=$(curl -s -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" "$API_URL" )
if [ $? -ne 0 ]; then
  echo "Error: Failed to fetch release info. Check curl error:"
  exit 1
fi

# echo "RELEASE_INFO: $RELEASE_INFO"
ASSETS_URL=$(echo "$RELEASE_INFO" | powershell -Command '
  $json = [Console]::In.ReadToEnd() | ConvertFrom-Json;
  $json.assets[0].url
')
echo "ASSETS_URL:$ASSETS_URL"


# 检查 API 响应是否包含错误
if echo "$RELEASE_INFO" | grep -q '"message":'; then
  ERROR_MESSAGE=$(echo "$RELEASE_INFO" | grep '"message":' | sed -E 's/.*"message": "([^"]+)".*/\1/')
  echo "Error: GitHub API returned an error: $ERROR_MESSAGE"
  echo "Raw API response:"
  echo "$RELEASE_INFO"
  exit 1
fi

# 最新版本标签
TAG_NAME=$(echo "$RELEASE_INFO" | grep '"tag_name":' | sed -E 's/.*"tag_name": "([^"]+)".*/\1/' | head -n 1)


# 尝试从 assets 中查找 .tar.gz 文件，优先选择包含 "release" 的文件
DOWNLOAD_URL=$(echo "$RELEASE_INFO" | grep -A 1 '.*\.tar\.gz"' | grep '"browser_download_url":' | sed -E 's/.*"browser_download_url": "([^"]+)".*/\1/' | grep -i "release" | head -n 1)
echo "初始查找DOWNLOAD_URL: $DOWNLOAD_URL"
echo "初始查找ARCHIVE_NAME: $ARCHIVE_NAME"

if [ -z "$DOWNLOAD_URL" ] || [ -z "$TAG_NAME" ]; then
  echo "Error: Unable to fetch latest release or tarball URL. Check your token, repository, or network."
  echo "Raw API response:"
  echo "$RELEASE_INFO"
  exit 1
fi

echo "Latest release found: $TAG_NAME"
echo "Downloading $ARCHIVE_TYPE file: $ARCHIVE_NAME"


# 下载文件
TEMP_ARCHIVE="$REPO_NAME-$TAG_NAME.$ARCHIVE_TYPE"

# 从ASSETS_URL下载文件
echo "Download URL: $DOWNLOAD_URL"
echo "Downloading $ARCHIVE_TYPE to $TEMP_ARCHIVE..."
curl -s -L -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/octet-stream" "$ASSETS_URL" -o "$TEMP_ARCHIVE"
if [ $? -ne 0 ]; then
  echo "Error: Failed to download $ARCHIVE_TYPE. Check curl error:"
  cat /tmp/curl_download_error.log
  exit 1
fi

# 验证下载的文件是否存在且不为空
if [ ! -s "$TEMP_ARCHIVE" ]; then
  echo "Error: Downloaded file $TEMP_ARCHIVE is empty or does not exist."
  exit 1
fi

# 验证文件类型
echo "Verifying file type of $TEMP_ARCHIVE..."
FILE_TYPE=$(file "$TEMP_ARCHIVE")
if ! echo "$FILE_TYPE" | grep -q "gzip compressed data"; then
  echo "Error: $TEMP_ARCHIVE is not a valid tar.gz file. File type: $FILE_TYPE"
  echo "First 10 lines of file:"
  head -n 10 "$TEMP_ARCHIVE"
  exit 1
fi


# 清空目标目录（避免残留文件）
echo "Clearing target directory $LOCAL_DIR..."
rm -rf "$LOCAL_DIR"/* || { echo "Error: Failed to clear $LOCAL_DIR."; exit 1; }

# 解压文件到目标目录
echo "Extracting $TEMP_ARCHIVE to $LOCAL_DIR..."
tar -xzf "$TEMP_ARCHIVE" -C "$LOCAL_DIR" --strip-components=1 || { echo "Error: Failed to extract tarball."; exit 1; }


# # 删除临时文件
# rm -f "$TEMP_ARCHIVE" || echo "Warning: Failed to delete temporary file $TEMP_ARCHIVE."

# 进入本地代码目录并执行 npm install
echo "Running npm install in $LOCAL_DIR..."
cd "$LOCAL_DIR" || exit 1
if [ -f "package.json" ]; then
  npm install || { echo "Error: Failed to run npm install."; exit 1; }
else
  echo "Warning: No package.json found in $LOCAL_DIR. Skipping npm install."
fi
  
echo "Successfully downloaded and extracted release $TAG_NAME ($ARCHIVE_NAME) to $LOCAL_DIR."
