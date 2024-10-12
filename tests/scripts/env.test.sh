#!/usr/bin/env sh

script="../../scripts/env.sh"
echo "--- Testing: ${script}"

run() {
  cmd=${script}" $1"

  output=$(${cmd})
  if [ $? -ne 0 ]; then
    echo "--- RUN FAIL: ${cmd} (${output})"
    exit 1
  else
    echo "--- RUN OK: ${cmd}"
  fi
}

# shellcheck disable=SC2016
run '--file=env.test.env test $TEST_ENV -eq 1'
unset -v TEST_ENV

# shellcheck disable=SC2016
run '--file=env.test.env --file=env2.test.env test $TEST_ENV -eq 1 -a $TEST_ENV2 -eq 2'
unset -v TEST_ENV
