using System.Runtime.Serialization;

namespace Common.DatabaseModels.helpers
{
    public enum Language
    {
        [EnumMember(Value = "English")]
        English,
        [EnumMember(Value = "Ukraine")]
        Ukraine,
        [EnumMember(Value = "Russian")]
        Russian
    }
}
