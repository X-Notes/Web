﻿using Backgrounds.Queries;
using Common.DTO.Backgrounds;
using DatabaseContext.Repositories.Users;
using Mapper.Mapping;
using MediatR;

namespace Backgrounds.Handlers.Queries;

public class GetUserBackgroundsQueryHandler : IRequestHandler<GetUserBackgroundsQuery, List<BackgroundDTO>>
{
    private readonly UserRepository userRepository;
    private readonly UserBackgroundMapper userBackgroundMapper;
    
    public GetUserBackgroundsQueryHandler(UserRepository userRepository, UserBackgroundMapper userBackgroundMapper)
    {
        this.userRepository = userRepository;
        this.userBackgroundMapper = userBackgroundMapper;
    }
    
    public async Task<List<BackgroundDTO>> Handle(GetUserBackgroundsQuery request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetUserWithBackgrounds(request.UserId);
        if (user != null)
        {
            return user.Backgrounds.Select(x => userBackgroundMapper.MapToBackgroundDTO(x)).ToList();
        }
        return new List<BackgroundDTO>();
    }
}