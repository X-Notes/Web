using Common.Naming;
using System.Collections.Generic;
using System.Linq;


namespace Common.DatabaseModels.models.NoteContent.NoteDict
{
    public static class HeadingNoteTypesDictionary
    {
        private static Dictionary<HeadingNoteTypes, string> headingNoteTypes;

        static HeadingNoteTypesDictionary()
        {
            headingNoteTypes = new Dictionary<HeadingNoteTypes, string>()
            {
                {  HeadingNoteTypes.H1, ModelsNaming.H1 },
                {  HeadingNoteTypes.H2, ModelsNaming.H2 },
                {  HeadingNoteTypes.H3, ModelsNaming.H3 },
            };
        }

        public static string GetValueFromDictionary(HeadingNoteTypes type)
        {
            return headingNoteTypes.GetValueOrDefault(type);
        }

        public static bool IsExistValue(string value)
        {
            return headingNoteTypes.Any(x => x.Value == value);
        }
    }
}
