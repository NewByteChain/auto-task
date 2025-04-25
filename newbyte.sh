#!/bin/bash

# 配置文件路径（相对于脚本位置）
GITHUB_TOKEN_FILE="$(dirname "$0")/github_token.txt" # 存储 GITHUB_TOKEN 的 txt 文件
PROXIES_FILE="$(dirname "$0")/proxies.txt"  # 指定要检查/创建的 txt 文件名
PRIVATE_KEY_FILE="$(dirname "$0")/private_keys.txt"  # 指定要检查/创建的 txt 文件名

# GitHub 仓库地址
REPO_URL="https://github.com/NewByteChain/on-chain-inter.git"

# 本地代码目录（默认脚本同级目录下的 repo 文件夹）
LOCAL_DIR="$(dirname "$0")/code"


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
  GITHUB_TOKEN=$(cat "$TOKEN_FILE" | tr -d '\n\r')  # 读取并去除换行符
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


# 创建本地目录（如果不存在）
mkdir -p "$LOCAL_DIR"

# 转换为 HTTPS URL 并嵌入 token
AUTH_REPO_URL=$(echo "$REPO_URL" | sed "s|https://|https://$GITHUB_TOKEN@|")

# 获取最新的 tag
LATEST_TAG=$(git ls-remote --tags "$AUTH_REPO_URL" | grep -v "{}" | awk '{print $2}' | grep -v "\^{}$" | sort -V | tail -n 1 | sed 's|refs/tags/||')

if [ -z "$LATEST_TAG" ]; then
  echo "Error: Unable to fetch the latest tag. Check your token or repository URL."
  exit 1
fi

echo "Latest tag found: $LATEST_TAG"


# 检查本地目录是否已经是一个 git 仓库
if [ -d "$LOCAL_DIR/.git" ]; then
  echo "Local directory is a git repository. Updating to tag $LATEST_TAG..."
  cd "$LOCAL_DIR" || exit 1
  git fetch --tags "$AUTH_REPO_URL" || { echo "Error: Failed to fetch tags."; exit 1; }
  git checkout "$LATEST_TAG" || { echo "Error: Failed to checkout tag $LATEST_TAG."; exit 1; }
  git pull "$AUTH_REPO_URL" "$LATEST_TAG" || { echo "Error: Failed to pull tag $LATEST_TAG."; exit 1; }
else
  echo "Cloning repository with tag $LATEST_TAG to $LOCAL_DIR..."
  git clone --branch "$LATEST_TAG" "$AUTH_REPO_URL" "$LOCAL_DIR" || { echo "Error: Failed to clone repository."; exit 1; }
fi

# 进入本地代码目录并执行 npm install
echo "Running npm install in $LOCAL_DIR..."
cd "$LOCAL_DIR" || exit 1
npm install || { echo "Error: Failed to run npm install."; exit 1; }

echo "Successfully updated to tag $LATEST_TAG and installed npm dependencies in $LOCAL_DIR."