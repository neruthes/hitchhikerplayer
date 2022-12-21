# Tests

## Test Cases

- Loading remote list URL.
- Uploading list file (tsv).
- Uploading list file (csv).
- Uploading list file (psv).
- Pasting tsv from clipboard.

## Test Workflow

- Start local server with `python3 -m http.server 29458`.
- Open [local server](http://localhost:29458/).
- Deny the default initialization dialogue.
- Load remote list URL `https://gist.githubusercontent.com/neruthes/c2673e9d86f3a5b288deb6903bdd692a/raw/62a0f7f2e10cb0bab296e283ddde21727c9f5b7b/gistfile1.txt`.
- Upload `tests/playlist.tsv`.
- Upload `tests/playlist.csv`.
- Upload `tests/playlist.psv`.
- Copy the content of `tests/playlist.tsv` and paste it into the table.
