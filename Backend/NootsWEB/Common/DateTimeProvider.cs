using System;

namespace Common
{
    public static class DateTimeProvider
    {
        public static DateTimeOffset Time => DateTimeOffset.UtcNow;
    }
}
