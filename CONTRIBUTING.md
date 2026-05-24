# Contributing Guidelines

Thank you for your interest in contributing! We welcome contributions of all kinds — bug fixes, new features, documentation improvements, and more.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for everyone.

## Getting Started

1. **Fork** the repository to your own GitHub account.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/test.git
   cd test
   ```
3. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Bug Fixes

- Check the [issue tracker](../../issues) to see if the bug has already been reported.
- If not, open a new issue describing the bug before submitting a fix.
- Reference the issue number in your pull request.

### New Features

- Open an issue first to discuss the feature and gather feedback before investing significant time.
- Keep changes focused — one feature or fix per pull request.

### Documentation

- Improvements to documentation are always welcome.
- Fix typos, clarify confusing sections, or add missing information.

## Pull Request Process

1. Ensure your branch is up to date with `main` before opening a PR:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Write a clear PR title and description explaining **what** changed and **why**.
3. Link any related issues using keywords like `Closes #123` or `Fixes #456`.
4. Be responsive to review feedback — address comments promptly.
5. A maintainer will merge the PR once it is approved.

## Coding Standards

- Follow the existing code style and conventions in the project.
- Keep commits small and focused; write meaningful commit messages.
- Use the present tense in commit messages: `Add feature` not `Added feature`.
- Avoid committing unrelated changes (e.g. formatting fixes mixed with logic changes).

## Reporting Issues

When opening a bug report, please include:

- A clear, descriptive title.
- Steps to reproduce the problem.
- Expected vs. actual behavior.
- Any relevant logs, screenshots, or error messages.
- Your environment details (OS, language/runtime version, etc.) if applicable.

---

We appreciate every contribution, no matter how small. Thank you for helping improve this project!
