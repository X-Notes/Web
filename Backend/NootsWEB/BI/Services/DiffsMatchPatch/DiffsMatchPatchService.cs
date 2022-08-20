using BI.Helpers;
using DiffMatchPatch;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BI.Services.DiffsMatchPatch
{
    public class DiffsMatchPatchService
    {
        private readonly diff_match_patch dmp = new diff_match_patch();

        private readonly ILogger<DiffsMatchPatchService> logger;

        public DiffsMatchPatchService(ILogger<DiffsMatchPatchService> logger)
        {
            this.logger = logger;
        }

        public string PatchToStr(List<List<object>> valuesDiffs, string str)
        {
            str = str ?? string.Empty;

            string Update(List<Diff> diffs)
            {
                var patchDB = dmp.patch_make(str, diffs);
                return dmp.patch_apply(patchDB, str)[0] as string;
            }

            var diffs = valuesDiffs.ConvertToDiffs();
            // var patches = dmp.patch_make(diffs);

            try
            {
                return Update(diffs);
            }
            catch (ArgumentOutOfRangeException argEx)
            {
                diffs = diffs.Where(x => x.operation != Operation.DELETE).ToList();
                try
                {
                    return Update(diffs);
                } catch (Exception ex)
                {
                    logger.LogError(ex.ToString());
                    return str;
                }
            }
            catch(Exception ex)
            {
                logger.LogError(ex.ToString());
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
