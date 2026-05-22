"""
Test cases for newtest.txt
"""

import os
import unittest


FILE_PATH = os.path.join(os.path.dirname(__file__), "newtest.txt")


class TestNewTestFileExists(unittest.TestCase):
    """Tests verifying the file exists and is accessible."""

    def test_file_exists(self):
        """newtest.txt should exist on disk."""
        self.assertTrue(os.path.exists(FILE_PATH), f"File not found: {FILE_PATH}")

    def test_file_is_a_regular_file(self):
        """newtest.txt should be a regular file, not a directory or symlink."""
        self.assertTrue(os.path.isfile(FILE_PATH))

    def test_file_is_readable(self):
        """newtest.txt should be readable by the current process."""
        self.assertTrue(os.access(FILE_PATH, os.R_OK))


class TestNewTestFileContent(unittest.TestCase):
    """Tests verifying the content of newtest.txt."""

    def setUp(self):
        with open(FILE_PATH, "r", encoding="utf-8") as fh:
            self.raw = fh.read()
            self.content = self.raw.strip()

    def test_file_is_not_empty(self):
        """newtest.txt should not be completely empty."""
        self.assertTrue(len(self.raw) > 0, "File is empty")

    def test_content_equals_newtest(self):
        """Stripped content should equal 'newtest'."""
        self.assertEqual(self.content, "newtest")

    def test_content_starts_with_newtest(self):
        """Content should start with the word 'newtest'."""
        self.assertTrue(self.content.startswith("newtest"))

    def test_content_is_lowercase(self):
        """Content should be entirely lowercase."""
        self.assertEqual(self.content, self.content.lower())

    def test_no_leading_whitespace(self):
        """Content should have no leading whitespace characters."""
        self.assertEqual(self.raw.lstrip(), self.raw)

    def test_single_line(self):
        """File should contain exactly one non-empty line."""
        non_empty_lines = [ln for ln in self.raw.splitlines() if ln.strip()]
        self.assertEqual(len(non_empty_lines), 1)

    def test_content_length(self):
        """Stripped content should be 7 characters long ('newtest')."""
        self.assertEqual(len(self.content), 7)

    def test_content_is_string(self):
        """Content read from file should be a string."""
        self.assertIsInstance(self.content, str)

    def test_content_has_no_special_characters(self):
        """Content should contain only alphanumeric characters."""
        self.assertTrue(self.content.isalnum(), "Content contains non-alphanumeric characters")


class TestNewTestFileEncoding(unittest.TestCase):
    """Tests verifying the file can be read as UTF-8."""

    def test_readable_as_utf8(self):
        """File should be readable as UTF-8 without errors."""
        try:
            with open(FILE_PATH, "r", encoding="utf-8") as fh:
                fh.read()
        except UnicodeDecodeError as exc:
            self.fail(f"File is not valid UTF-8: {exc}")

    def test_file_size_is_reasonable(self):
        """File size should be greater than 0 and less than 1 MB."""
        size = os.path.getsize(FILE_PATH)
        self.assertGreater(size, 0)
        self.assertLess(size, 1_048_576)  # 1 MB


class TestNewTestFileEdgeCases(unittest.TestCase):
    """Edge-case and boundary tests."""

    def test_open_twice_returns_same_content(self):
        """Reading the file twice should return identical content."""
        with open(FILE_PATH, "r", encoding="utf-8") as fh:
            first = fh.read()
        with open(FILE_PATH, "r", encoding="utf-8") as fh:
            second = fh.read()
        self.assertEqual(first, second)

    def test_readlines_returns_list(self):
        """readlines() should return a list."""
        with open(FILE_PATH, "r", encoding="utf-8") as fh:
            lines = fh.readlines()
        self.assertIsInstance(lines, list)
        self.assertGreater(len(lines), 0)

    def test_first_line_contains_newtest(self):
        """The first line of the file should contain 'newtest'."""
        with open(FILE_PATH, "r", encoding="utf-8") as fh:
            first_line = fh.readline().strip()
        self.assertIn("newtest", first_line)

    def test_content_not_none(self):
        """File content should never be None."""
        with open(FILE_PATH, "r", encoding="utf-8") as fh:
            content = fh.read()
        self.assertIsNotNone(content)

    def test_content_not_whitespace_only(self):
        """File should not contain only whitespace."""
        with open(FILE_PATH, "r", encoding="utf-8") as fh:
            content = fh.read()
        self.assertTrue(content.strip(), "File contains only whitespace")


if __name__ == "__main__":
    unittest.main(verbosity=2)
