using Common.Naming;
using System.Collections.Generic;


namespace Common.DTO.notes.FullNoteContent.NoteContentTypeDict
{
    public static class NoteContentTypeDictionary
    {
        private static Dictionary<NoteContentType, string> types;

        static NoteContentTypeDictionary()
        {
            types = new Dictionary<NoteContentType, string>()
            {
                {  NoteContentType.ALBUM, ModelsNaming.Album }
            };
        }

        public static string GetValueFromDictionary(NoteContentType type)
        {
            return types.GetValueOrDefault(type);
        }

    }
}
