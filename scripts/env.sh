#!/bin/sh

set -eu

### This script is used to set up the environment using one or more .env files

# Usage: ./env.sh --file=./stack/docker-compose.env --quiet --file=./another.env "npm run start"
# --quiet flag is optional and only affects processing of files specified after it in command line

### Set default values for variables:
quiet=false
cmd=""
args=""

### load_env function:
load_env() {
  file="$1"
  if [ ! -f "$file" ]; then
    echo "Error: $file does not exist." >&2
    exit 4
  fi

  if [ "$quiet" = false ]; then
    echo "Setting environment variables from $file..."
  fi

  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    case $line in
      \#*|"") continue ;;
    esac
    # Extract variable name and value
    var_name="${line%%=*}"
    var_value="${line#*=}"
    # Remove surrounding quotes if present
    var_value=$(echo "$var_value" | sed -e 's/^"//' -e 's/"$//')
    if [ "$quiet" = false ]; then
      echo "Variable: ${var_name}=${var_value}"
    fi
    export "${var_name}=${var_value}"
  done < "$file"
}

### Parse command line options:
while [ $# -gt 0 ]; do
  case "$1" in
    --file=*)
      load_env "${1#*=}"
      ;;
    --quiet|-q)
      quiet=true
      ;;
    --*)
      echo "Unknown option $1" >&2
      exit 1
      ;;
    *)
      if [ -z "$cmd" ]; then
        cmd="$1"
      else
        args="$args \"$1\""
      fi
      ;;
  esac
  shift
done

### Show error if no command is specified:
if [ -z "$cmd" ]; then
  echo "No command specified" >&2
  exit 2
fi

if [ "$quiet" = false ]; then
  echo "Executing: $cmd $args"
fi

# shellcheck disable=SC2086
eval $cmd $args
