using Newtonsoft.Json;

namespace Common.DatabaseModels.Models;

public static class DbJsonConverter
{
    public static string Serialize<T>(T @object)
    {
        if (@object == null)
        {
            return null;
        }
        
        return JsonConvert.SerializeObject(@object);
    }
    
    public static T DeserializeObject<T>(string json)
    {
        if (string.IsNullOrEmpty(json))
        {
            return default;
        }
        
        return JsonConvert.DeserializeObject<T>(json);
    }
}