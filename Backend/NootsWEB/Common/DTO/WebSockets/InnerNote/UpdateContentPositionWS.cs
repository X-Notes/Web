using System;


namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateContentPositionWS
    {
        public Guid ContentId { set; get; }

        public int Order { set; get; }

        public int Version { set; get; }

        public UpdateContentPositionWS(Guid contentId, int order, int version)
        {
            ContentId = contentId;
            Order = order;
            Version = version;
        }
    }
}
