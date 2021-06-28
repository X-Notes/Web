using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text;
using System.Threading.Tasks;

namespace Common.Attributes
{
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
