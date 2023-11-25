

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Files
{
    public class PathFileSuffixes
    {
        public PathFileSuffixes()
        {
            
        }
        
        public PathFileSuffixes(string small, string medium, string large, string @default)
        {
            Small = small;
            Medium = medium;
            Large = large;
            Default = @default;
        }
        
        public string Small { set; get; }

        public string Medium { set; get; }

        public string Large { set; get; }

        public string Default { set; get; }

        public string GetFromSmallPath()
        {
            return Small ?? Medium ?? Large ?? Default;
        }

        public string GetFromDefaultPath()
        {
            return Default ?? Large ?? Medium ?? Small;
        }

        public List<string> GetNotNullPathes()
        {
            var result = new List<string>();
            if (!string.IsNullOrEmpty(Small))
            {
                result.Add(Small);
            }
            if (!string.IsNullOrEmpty(Medium))
            {
                result.Add(Medium);
            }
            if (!string.IsNullOrEmpty(Large))
            {
                result.Add(Large);
            }
            if (!string.IsNullOrEmpty(Default))
            {
                result.Add(Default);
            }
            return result;
        }
    }
}
