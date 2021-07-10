using System;
using System.Linq;

namespace Common.DatabaseHelper
{
    public static class QueryHelper
    {
        public static IQueryable<T> If<T>(
            this IQueryable<T> source,
            bool condition,
            Func<IQueryable<T>, IQueryable<T>> transform
        )
        {
            return condition ? transform(source) : source;
        }
    }
}
