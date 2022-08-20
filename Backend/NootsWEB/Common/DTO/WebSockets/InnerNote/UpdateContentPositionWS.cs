using System;


namespace Common.DTO.WebSockets.InnerNote
{
    public class UpdateContentPositionWS
    {
        public Guid ContentId { set; get; }
        public int Order { set; get; }

        public UpdateContentPositionWS(Guid contentId, int order)
        {
            ContentId = contentId;
            Order = order;
        }
    }
}
