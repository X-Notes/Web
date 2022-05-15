using DiffMatchPatch;
using System.Collections.Generic;
using System.Linq;

namespace BI.Helpers
{
    public static class DiffMatchPatchHelper
    {
        public static List<Diff> ConvertToDiffs(this List<List<object>> values)
        {
            return values.Select(x => {
                var op = GetOperation(x[0]);
                var text = (string)x[1];
                return new Diff(op, text);
            }).ToList();
        }

        private static Operation GetOperation(object value)
        {
            var op = int.Parse(value.ToString());
            switch (op)
            {
                case 0: return Operation.EQUAL;               
                case 1: return Operation.INSERT;
                case -1: return Operation.DELETE;
                default: throw new System.Exception("Incorrect type");
            }
        }
    }
}
