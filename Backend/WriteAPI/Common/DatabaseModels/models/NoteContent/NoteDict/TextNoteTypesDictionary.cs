using System.Collections.Generic;


namespace Common.DatabaseModels.models.NoteContent.NoteDict
{
    public static class TextNoteTypesDictionary
    {
        private static Dictionary<TextNoteTypes, string> textNoteTypes;

        static TextNoteTypesDictionary()
        {
            textNoteTypes = new Dictionary<TextNoteTypes, string>()
            {
                {  TextNoteTypes.TEXT, "TEXT" },
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
    }
}
