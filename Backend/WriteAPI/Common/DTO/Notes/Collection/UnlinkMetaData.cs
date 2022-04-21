using System;
using System.Collections.Generic;
using System.Linq;

namespace Common.DTO.Notes.Collection
{
    public class UnlinkMetaData
    {
        public Guid Id { set; get; }

        public List<Guid> AdditionalIds { set; get; }

        public List<Guid> GetIds()
        {
            var ids = new List<Guid>() { Id };

            if(AdditionalIds != null && AdditionalIds.Any())
            {
                ids.AddRange(AdditionalIds);
            } 

            return ids;
        }
    }
}
