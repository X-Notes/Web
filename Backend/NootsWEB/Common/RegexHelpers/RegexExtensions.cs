using System;
using System.Text.RegularExpressions;

namespace Common.RegexHelpers;

public static class RegexExtensions
{
    public static (bool end, int number) EndsWithNumber(this string input)
    {
        // Define the regular expression pattern to match the expected format
        string pattern = @"^.*\((\d+)\)$";

        // Use Regex.Match method to find a match in the input string
        Match match = Regex.Match(input, pattern);

        if (match.Success)
        {
            // Extract the captured number group
            Group numberGroup = match.Groups[1];

            // Try to parse the number as an int
            bool parseSuccess = int.TryParse(numberGroup.Value, out var number);

            return (parseSuccess, number);
        }

        return (false, 0);
    }

    public static string RemoveLastParentheses(this string input)
    {
        // Find the position of the last '('
        int startIndex = input.LastIndexOf("(", StringComparison.Ordinal);

        // Find the position of the corresponding ')'
        int endIndex = input.IndexOf(")", startIndex, StringComparison.Ordinal);

        // Check if both '(' and ')' exist and ')' comes after '('
        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
        {
            // Remove the substring between '(' and ')'
            input = input.Remove(startIndex, endIndex - startIndex + 1);
        }

        return input;
    }
}
