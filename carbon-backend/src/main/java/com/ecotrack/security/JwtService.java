package com.ecotrack.security;
import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private final SecretKey sk =
	        Keys.secretKeyFor(SignatureAlgorithm.HS256);
}
