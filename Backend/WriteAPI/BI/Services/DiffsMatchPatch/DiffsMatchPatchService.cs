using BI.Helpers;
using DiffMatchPatch;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BI.Services.DiffsMatchPatch
{
    public class DiffsMatchPatchService
    {
        private readonly diff_match_patch dmp = new diff_match_patch();

        public DiffsMatchPatchService()
        {

        }

        public string PatchToStr(List<List<object>> valuesDiffs, string str)
        {
            var diffs = valuesDiffs.ConvertToDiffs();
            var patches = dmp.patch_make(diffs);

            str = str ?? string.Empty;
            try
            {
                var patchDB = dmp.patch_make(str, diffs);
                return dmp.patch_apply(patchDB, str)[0] as string;
            }
            catch (ArgumentOutOfRangeException ex)
            {
                diffs = diffs.Where(x => x.operation != Operation.DELETE).ToList();
                var patchDB = dmp.patch_make(str, diffs);
                return dmp.patch_apply(patchDB, str)[0] as string;
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex);
                return str;
            }

            //return dmp.patch_apply(patches, str)[0] as string;
        }

        public string Patch(string to, string from)
        {
            to = to ?? string.Empty;
            from = from ?? string.Empty;

            var patches = dmp.patch_make(from, to);
            return dmp.patch_apply(patches, from)[0] as string;
        }
    }
}
