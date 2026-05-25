import random


def roll_dice() -> int:
    """Return a random integer between 1 and 6 (inclusive), like a dice roll."""
    return random.randint(1, 6)


if __name__ == "__main__":
    result = roll_dice()
    print(f"You rolled: {result}")
