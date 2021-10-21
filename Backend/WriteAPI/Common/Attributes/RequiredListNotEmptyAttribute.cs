using System;
using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace Common.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public sealed class RequiredListNotEmptyAttribute : RequiredAttribute
    {
        public override bool IsValid(object value) => (value as IEnumerable)?.GetEnumerator().MoveNext() ?? false;
    }
}
