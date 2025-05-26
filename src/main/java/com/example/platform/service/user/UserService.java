package com.example.platform.service.user;

import com.example.platform.dto.fund.FundResponse;
import com.example.platform.dto.auth.LoginRequest;
import com.example.platform.dto.OrganizerProfileResponse;
import com.example.platform.dto.auth.RegistrationRequest;
import com.example.platform.mapper.FundMapper;
import com.example.platform.model.User;
import com.example.platform.repository.FundRepository;
import com.example.platform.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    private final FundRepository fundRepository;

    private final FundMapper fundMapper;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder, AuthenticationManager authenticationManager, JwtService jwtService, FundRepository fundRepository, FundMapper fundMapper) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.fundRepository = fundRepository;
        this.fundMapper = fundMapper;
    }

    public User register(RegistrationRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setDisplayName(request.getDisplayName());
        user.setPassword(bCryptPasswordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        return userRepository.save(user);
    }

    public String verify(LoginRequest loginRequest) {

        Authentication authenticate = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        if(authenticate.isAuthenticated()) {

            User user = userRepository.findByUsername(loginRequest.getUsername());
            return jwtService.generateToken(user);
        }
        return "fail";
    }

    @Transactional
    public OrganizerProfileResponse getOrganizerProfile(Long organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new EntityNotFoundException("Organizer not found"));

        List<FundResponse> funds = fundRepository.findByOwnerId(organizerId)
                .stream()
                .map(fundMapper::toResponse)
                .toList();

        OrganizerProfileResponse response = new OrganizerProfileResponse();
        response.setId(organizer.getId());
        response.setUsername(organizer.getUsername());
        response.setDisplayName(organizer.getDisplayName());
        response.setFunds(funds);

        return response;
    }

    @Transactional
    public OrganizerProfileResponse getOrganizerProfile(String username) {
        User organizer = userRepository.findByUsername(username);
        if (organizer == null) {
            throw new EntityNotFoundException("Organizer not found");
        }

        List<FundResponse> funds = fundRepository.findByOwnerId(organizer.getId())
                .stream()
                .map(fundMapper::toResponse)
                .toList();

        OrganizerProfileResponse response = new OrganizerProfileResponse();
        response.setId(organizer.getId());
        response.setUsername(organizer.getUsername());
        response.setDisplayName(organizer.getDisplayName());
        response.setFunds(funds);

        return response;
    }
}
