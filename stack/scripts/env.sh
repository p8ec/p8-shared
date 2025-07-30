#!/bin/sh

### This script is used to set up the environment using .env

# Usage: ./env.sh --file=./stack/docker-compose.env --quiet "npm run start"

### Set default values for variables:
file=.env

### Parse command line options:
for i in "$@"; do
  case $i in
    --file=*)
      file="${i#*=}"
      shift # past argument=value
      ;;
    --quiet)
      quiet=true
      shift # past argument with no value
      ;;
    --*)
      echo "Unknown option $i"
      exit 1
      ;;
    *)
      if [ -z "$cmd" ]; then
        cmd="$i"
      else
        if [ -z "$args" ]; then
          args="\"$i\""
        else
          args="$args \"$i\""
        fi
      fi
      ;;
  esac
done

if [ -z "$cmd" ]; then
  echo "No command specified"
  exit 2
fi

grep='^#' # remove comments

echo "--- env.sh ---"
echo "File: $file"
echo "Command: $cmd"
echo "Args: $args"

if [ -f "$file" ]; then
  lines=$(grep -v "$grep" "$file")
  if [ -z "$quiet" ]; then
    echo "Setting environment variables from $file..."
  fi
  for var in $lines
  do
    var_name=$(echo "${var}" | cut -d '=' -f 1)
    var_value=$(eval echo "${var}" | cut -d '=' -f 2-) # expand value

    if [ -z "$quiet" ]; then
      echo "Variable: ${var_name}=${var_value}"
    fi

    export "${var_name}=${var_value}"
  done
else
  echo "Warning: $file file not found. Please create it using $file.example as a template if you plan to override env vars. This message can be safely ignored."
fi

if [ -z "$quiet" ]; then
  echo "Executing: $cmd $args"
fi

# shellcheck disable=SC2086
/bin/sh -c "$cmd $args"
