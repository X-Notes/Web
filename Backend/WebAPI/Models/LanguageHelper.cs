using System.Globalization;

namespace WebAPI.Models;

public static class LanguageHelper
{
    public static LanguageENUM GetLanguageEnumFromCultureInfo(CultureInfo? culture)
    {
        if (culture == null)
        {
            return LanguageENUM.English;
        }
        
        switch (culture.TwoLetterISOLanguageName)
        {
            case "en":
                return LanguageENUM.English;
            case "uk":
                return LanguageENUM.Ukraine;
            case "ru":
                return LanguageENUM.Russian;
            case "es":
                return LanguageENUM.Spanish;
            case "fr":
                return LanguageENUM.French;
            case "it":
                return LanguageENUM.Italian;
            case "de":
                return LanguageENUM.German;
            case "sv":
                return LanguageENUM.Swedish;
            case "pl":
                return LanguageENUM.Polish;
            case "zh":
                return LanguageENUM.Chinese;
            case "ja":
                return LanguageENUM.Japan;
            default:
                return LanguageENUM.English;
        }
    }
}



