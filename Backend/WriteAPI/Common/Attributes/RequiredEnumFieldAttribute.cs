using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Threading.Tasks;

namespace Common.Attributes
{
    public class RequiredEnumFieldAttribute : RequiredAttribute
    {
        public override bool IsValid(object value)
        {
            if (value == null)
            {
                return false;
            }

            var type = value.GetType();
            return type.IsEnum && Enum.IsDefined(type, value);
        }
    }
}
