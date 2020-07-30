using Common.DTO.orders;
using Domain.Commands.orders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using System.Linq;

namespace BI.services
{
    public class OrderHandlerCommand : IRequestHandler<UpdateOrderCommand, Unit>
    {
        private readonly LabelRepository labelRepository;
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        public OrderHandlerCommand(LabelRepository labelRepository, NoteRepository noteRepository, UserRepository userRepository)
        {
            this.labelRepository = labelRepository;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
        }
        public async Task<Unit> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
        {
            switch(request.OrderEntity)
            {
                case OrderEntity.Label:
                    {
                        var labels = (await userRepository.GetUserWithLabels(request.Email)).Labels;

                        if(int.TryParse(request.EntityId, out var id))
                        {
                            var label = labels.FirstOrDefault(x => x.Id == id);
                            if (label != null)
                            {
                                var tempLabels = labels.Where(x => x.IsDeleted == label.IsDeleted).ToList();
                                if(label.Order < request.Position)
                                {
                                    tempLabels.Where(x => x.Order <= request.Position && x.Order > label.Order).ToList().ForEach(x => x.Order = x.Order - 1);
                                    label.Order = request.Position;
                                }
                                else if(label.Order > request.Position)
                                {
                                    tempLabels.Where(x => x.Order >= request.Position && x.Order < label.Order).ToList().ForEach(x => x.Order = x.Order + 1);
                                    label.Order = request.Position;
                                }
                                await labelRepository.UpdateRangeLabels(tempLabels);
                            }
                        }
                        Console.WriteLine("Label");
                        break;
                    }
                case OrderEntity.Note:
                    {
                        Console.WriteLine("Note");
                        break;
                    }
                default:
                    {
                        throw new Exception();
                    }
            }
            return Unit.Value;
        }
    }
}
