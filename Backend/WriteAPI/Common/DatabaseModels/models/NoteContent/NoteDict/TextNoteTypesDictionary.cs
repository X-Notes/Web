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

        public static bool IsExistValue(string value)
        {
            return textNoteTypes.Any(x => x.Value == value);
        }
    }
}
