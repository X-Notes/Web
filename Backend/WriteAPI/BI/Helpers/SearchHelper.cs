using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using System.Collections.Generic;
using System.Linq;

namespace BI.Helpers
{
    public static class SearchHelper
    {
        public static bool IsMatchContent(string content, string search)
        {
            if (!string.IsNullOrEmpty(content) && content.Contains(search))
            {
                return true;
            }

            return false;
        }

        public static bool IsMatchContent(List<TextBlock> contents, string search)
        {
            var contentText = contents.Any() ? contents.Select(x => x.Text).Aggregate((pv, cv) => pv + cv) : string.Empty;
            if (!string.IsNullOrEmpty(contentText) && contentText.Contains(search))
            {
                return true;
            }

            return false;
        }

    }
}
