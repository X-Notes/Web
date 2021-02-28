using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.NoteContent.NoteDict
{
    public static class HeadingNoteTypesDictionary
    {
        private static Dictionary<HeadingNoteTypes, string> headingNoteTypes;

        static HeadingNoteTypesDictionary()
        {
            headingNoteTypes = new Dictionary<HeadingNoteTypes, string>()
            {
                {  HeadingNoteTypes.H1, "H1" },
                {  HeadingNoteTypes.H2, "H2" },
                {  HeadingNoteTypes.H3, "H3" },
            };
        }

        public static string GetValueFromDictionary(HeadingNoteTypes type)
        {
            return headingNoteTypes.GetValueOrDefault(type);
        }
    }
}
