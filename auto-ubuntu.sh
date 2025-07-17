#!/bin/bash

# 本地代码目录（默认脚本同级目录下的 repo 文件夹）
TOKEN=$GITHUB_TOKEN  # 替换为你的 PAT
LOCAL_DIR="$(dirname "$0")/code"
OWNER="NewByteChain"                           # 替换为 GitHub 仓库所有者
REPO="on-chain-inter"                          # 替换为 GitHub 仓库名称

# echo "GITHUB_TOKEN: $TOKEN"

# GitHub API URL
GITHUB_API="https://api.github.com"

# 使用 curl 调用 GitHub API，捕获 HTTP 状态码和响应
gh_curl() {
  local url="$1"
  # 使用 -w 获取 HTTP 状态码，-o 保存响应，-s 静默模式
  local TEMP_ARCHIVE=$(mktemp)
  local http_code=$(curl -s -w "%{http_code}" -H "Authorization: token $TOKEN" \
       -H "Accept: application/vnd.github.v3+json" \
       -H "X-GitHub-Api-Version: 2022-11-28" \
       -o "$TEMP_ARCHIVE" "$url")
  echo "$TEMP_ARCHIVE" "$http_code"
}

# 获取最新发行版本的以 .tar.gz 结尾的第一个资产文件名
parser='.assets | map(.name) | map(select(test("\\.tar\\.gz$")))[0]'

# 调用 API 并捕获响应
read TEMP_ARCHIVE http_code < <(gh_curl "$GITHUB_API/repos/$OWNER/$REPO/releases/latest")

# 检查 HTTP 状态码
if [ "$http_code" -ne 200 ]; then
  echo "错误：GitHub API 请求失败，HTTP 状态码：$http_code" >&2
  echo "响应内容：" >&2
  cat "$TEMP_ARCHIVE" >&2
  rm -f "$TEMP_ARCHIVE"
  exit 1
fi

# 使用 jq 解析响应，错误直接输出到终端
FILE=$(jq -r "$parser" "$TEMP_ARCHIVE" 2>&1)
jq_exit_code=$?

# 检查 jq 是否成功
if [ $jq_exit_code -ne 0 ]; then
  echo "错误：jq 解析失败，退出码：$jq_exit_code" >&2
  echo "jq 错误输出：$FILE" >&2
  echo "API 响应内容：" >&2
  cat "$TEMP_ARCHIVE" >&2
  rm -f "$TEMP_ARCHIVE"
  exit 1
fi

# 检查资产文件名是否有效
if [ -z "$FILE" ] || [ "$FILE" = "null" ]; then
  echo "错误：未找到以 .tar.gz 结尾的资产或最新发行版本" >&2
  echo "API 响应内容：" >&2
  cat "$TEMP_ARCHIVE" >&2
  rm -f "$TEMP_ARCHIVE"
  exit 1
fi

# 获取资产 ID
parser_id=".assets | map(select(.name == \"$FILE\"))[0].id"
asset_id=$(jq "$parser_id" "$TEMP_ARCHIVE" 2>&1)
jq_exit_code=$?

# 检查资产 ID 是否有效
if [ $jq_exit_code -ne 0 ] || [ -z "$asset_id" ] || [ "$asset_id" = "null" ]; then
  echo "错误：无法获取资产 ID，退出码：$jq_exit_code" >&2
  echo "jq 错误输出：$asset_id" >&2
  echo "API 响应内容：" >&2
  cat "$TEMP_ARCHIVE" >&2
  rm -f "$TEMP_ARCHIVE"
  exit 1
fi

# 下载资产，错误直接输出到终端
curl -L -o "$FILE" \
     -H "Authorization: token $TOKEN" \
     -H "Accept: application/octet-stream" \
     -H "X-GitHub-Api-Version: 2022-11-28" \
     "$GITHUB_API/repos/$OWNER/$REPO/releases/assets/$asset_id" 2>&1
curl_exit_code=$?

# 检查下载是否成功
if [ $curl_exit_code -ne 0 ]; then
  echo "错误：下载文件失败，退出码：$curl_exit_code" >&2
  rm -f "$TEMP_ARCHIVE"
  exit 1
fi

echo "成功下载文件：$FILE"

# 清理临时文件
rm -f "$TEMP_ARCHIVE"


# 解压文件到目标目录
echo "Extracting $FILE to $LOCAL_DIR..." >&2
tar -xzf "$FILE" -C "$LOCAL_DIR" >&2
tar_exit_code=$?

# 检查解压是否成功
if [ $tar_exit_code -ne 0 ]; then
  echo "错误：解压文件 $FILE 失败，退出码：$tar_exit_code" >&2
  rm -f "$response_file" "$FILE"
  exit 1
fi

rm -f "$FILE"

echo "成功解压文件：$FILE"
