#!/bin/sh

run_test() {
  ### Launch the test docker compose file and wait for it to become healthy, then shut it down:
  docker compose -f "${1}" config --quiet && \
    docker compose -f "${1}" up -d --wait --wait-timeout 30 && \
    docker compose -f "${1}" down --remove-orphans

  ### Check the exit code of the last command:
  # shellcheck disable=SC2181
  if [ $? -ne 0 ]; then
    echo "Error: Failed to run docker compose with file ${1}"
    exit 1
  fi

  echo "Docker compose file ${1} executed successfully."
}

run_up() {
  ### Launch the docker compose file and wait for it to become healthy:
  docker compose -f "${1}" config --quiet && \
    docker compose -f "${1}" up -d --wait --wait-timeout 30

  ### Check the exit code of the last command:
  # shellcheck disable=SC2181
  if [ $? -ne 0 ]; then
    echo "Error: Failed to run docker compose with file ${1}"
    exit 1
  fi

  echo "Docker compose file ${1} is up and running."
}

run_down() {
  ### Shut down the docker compose file and remove orphans:
  docker compose -f "${1}" down --remove-orphans

  ### Check the exit code of the last command:
  # shellcheck disable=SC2181
  if [ $? -ne 0 ]; then
    echo "Error: Failed to shut down docker compose with file ${1}"
    exit 1
  fi

  echo "Docker compose file ${1} has been shut down."
}

SCAN_DIR=. # Default to current directory if not provided
SCAN_CMD="test"

### Parse command line options:
for i in "$@"; do
  case $i in
    --dir=*)
      SCAN_DIR="${i#*=}"
      shift # past argument=value
      ;;
    --*)
      echo "Unknown option $i"
      exit 1
      ;;
    *)
      SCAN_CMD="${i#*=}"
      shift # past argument=value
      ;;
  esac
done

### Check if the command is valid:
if ! type "run_${SCAN_CMD}" > /dev/null 2>&1; then
  echo "Error: Invalid command '${SCAN_CMD}'. Valid commands are: test, up, down."
  exit 1
fi

### Scan for docker-compose files in the specified directory:
docker_compose_files=$(find "${SCAN_DIR}" -type f -name "docker-compose*.run.yml" -o -name "docker-compose*.run.yaml")

### Iterate over each found docker-compose file:
for file in ${docker_compose_files}; do
  run_"${SCAN_CMD}" "${file}"
done


