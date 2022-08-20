using System;
using System.ComponentModel.DataAnnotations;

namespace Common.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class ValidationGuidAttribute : ValidationAttribute
    {
        private const string DefaultErrorMessage = "'{0}' does not contain a valid guid";

        public ValidationGuidAttribute() : base(DefaultErrorMessage)
        {
        }

        public override bool IsValid(object value)
        {
            if (value == null) return false;

            var valueType = value.GetType();
            var emptyField = valueType.GetField("Empty");

            if (emptyField == null) return true;

            var emptyValue = emptyField.GetValue(null);

            return !value.Equals(emptyValue);
        }
    }
}
