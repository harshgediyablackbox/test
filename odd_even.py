def check_odd_even(number):
    """Return 'Odd' or 'Even' for a given integer."""
    if number % 2 == 0:
        return "Even"
    else:
        return "Odd"


def classify_list(numbers):
    """Classify each number in a list as odd or even."""
    results = {}
    for n in numbers:
        results[n] = check_odd_even(n)
    return results


def get_odds(numbers):
    """Return only the odd numbers from a list."""
    return [n for n in numbers if n % 2 != 0]


def get_evens(numbers):
    """Return only the even numbers from a list."""
    return [n for n in numbers if n % 2 == 0]


def main():
    sample = list(range(1, 21))  # numbers 1 through 20

    print("=== Odd / Even Classifier ===\n")

    print(f"{'Number':<10} {'Result':<10}")
    print("-" * 20)
    for number in sample:
        print(f"{number:<10} {check_odd_even(number):<10}")

    print("\n--- Summary ---")
    odds = get_odds(sample)
    evens = get_evens(sample)
    print(f"Odd  numbers : {odds}")
    print(f"Even numbers : {evens}")
    print(f"Total odd  : {len(odds)}")
    print(f"Total even : {len(evens)}")

    # Interactive check
    print("\n--- Interactive Mode ---")
    try:
        user_input = input("Enter a number to check (or press Enter to skip): ").strip()
        if user_input:
            num = int(user_input)
            print(f"{num} is {check_odd_even(num)}.")
    except ValueError:
        print("Invalid input — please enter an integer next time.")


if __name__ == "__main__":
    main()
