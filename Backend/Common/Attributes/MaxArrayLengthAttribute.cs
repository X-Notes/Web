using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace Common.Attributes;

public class MaxArrayLengthAttribute(int length) : ValidationAttribute
{
    public override bool IsValid(object value) {
        if (value is ICollection == false) { return false; }
        return ((ICollection)value).Count <= length;
    }
}