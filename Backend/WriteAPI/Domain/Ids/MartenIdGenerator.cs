using Marten;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Ids
{
    public class MartenIdGenerator : IIdGenerator
    {
        private readonly IDocumentSession documentSession;

        public MartenIdGenerator(IDocumentSession documentSession)
        {
            this.documentSession = documentSession;
        }

        public Guid New() => documentSession.Events.StartStream().Id;
    }
}
