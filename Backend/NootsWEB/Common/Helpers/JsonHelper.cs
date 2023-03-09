using Newtonsoft.Json;

namespace Common.Helpers;

public static class JsonHelper
{
    static JsonSerializerSettings serializeSettings = new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore };

    static JsonSerializerSettings deserializeSettings = new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore, Formatting = Formatting.Indented, MaxDepth = int.MaxValue };

    public static string JSerialize<T>(this T tree)
    {
        return JsonConvert.SerializeObject(tree, serializeSettings);
    }

    public static T JDeserializeObject<T>(this string obj)
    {
        if (!string.IsNullOrEmpty(obj))
            return JsonConvert.DeserializeObject<T>(obj, deserializeSettings);

        return default(T);
    }
}
