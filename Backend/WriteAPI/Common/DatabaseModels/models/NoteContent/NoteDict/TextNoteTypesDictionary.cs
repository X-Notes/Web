using System.Collections.Generic;
using System.Linq;

namespace Common.DatabaseModels.models.NoteContent.NoteDict
{
    public static class TextNoteTypesDictionary
    {
        private static Dictionary<TextNoteTypes, string> textNoteTypes;

        static TextNoteTypesDictionary()
        {
            textNoteTypes = new Dictionary<TextNoteTypes, string>()
            {
                {  TextNoteTypes.DEFAULT, "DEFAULT" },
                {  TextNoteTypes.HEADING, "HEADING" },
                {  TextNoteTypes.DOTLIST, "DOTLIST" },
                {  TextNoteTypes.NUMBERLIST, "NUMBERLIST" },
                {  TextNoteTypes.CHECKLIST, "CHECKLIST" },
            };
        }

        public static string GetValueFromDictionary(TextNoteTypes type)
        {
            return textNoteTypes.GetValueOrDefault(type);
        }

        public static TextNoteTypes GetKeyFromDictionary(string key)
        {
            return textNoteTypes.First(x => x.Value == key).Key;
        }

        public static bool IsExistValue(string value)
        {
            return textNoteTypes.Any(x => x.Value == value);
        }

        public static string GetNextTypeForInserting(string typeStr)
        {
            var type = GetKeyFromDictionary(typeStr);
            var result = type switch
            {
                TextNoteTypes.CHECKLIST => GetValueFromDictionary(TextNoteTypes.CHECKLIST),
                TextNoteTypes.DOTLIST => GetValueFromDictionary(TextNoteTypes.DOTLIST),
                TextNoteTypes.NUMBERLIST => GetValueFromDictionary(TextNoteTypes.NUMBERLIST),
                _ => GetValueFromDictionary(TextNoteTypes.DEFAULT),
            };
            return result;
        }
    }
}
