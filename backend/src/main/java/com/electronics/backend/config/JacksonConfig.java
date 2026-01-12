package com.electronics.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // 1. Module pour Java 8 Date/Time (NÉCESSAIRE pour LocalDateTime)
        mapper.registerModule(new JavaTimeModule());

        // 2. Module pour Hibernate 6 (CORRECTION ICI)
        Hibernate6Module hibernate6Module = new Hibernate6Module();

        // Configuration Hibernate 6
        hibernate6Module.disable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        hibernate6Module.enable(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS);
        hibernate6Module.enable(Hibernate6Module.Feature.REPLACE_PERSISTENT_COLLECTIONS);
        hibernate6Module.enable(Hibernate6Module.Feature.WRITE_MISSING_ENTITIES_AS_NULL);

        mapper.registerModule(hibernate6Module);

        // Configuration Jackson
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        mapper.configure(SerializationFeature.WRITE_DATE_KEYS_AS_TIMESTAMPS, false);
        mapper.configure(SerializationFeature.WRITE_DATES_WITH_ZONE_ID, false);

        return mapper;
    }

    // Alternative avec Jackson2ObjectMapperBuilder
    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        Hibernate6Module hibernate6Module = new Hibernate6Module();
        hibernate6Module.disable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        hibernate6Module.enable(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS);

        return new Jackson2ObjectMapperBuilder()
                .modulesToInstall(new JavaTimeModule(), hibernate6Module)
                .failOnEmptyBeans(false)
                .indentOutput(true)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
