package com.example.livraison_backend.service;

import com.example.livraison_backend.model.TrackingEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TrackingHub {
    private final Map<Long, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long deliveryId) {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(deliveryId, id ->
                Collections.synchronizedSet(new HashSet<>())
        ).add(emitter);

        emitter.onCompletion(() -> remove(deliveryId, emitter));
        emitter.onTimeout(() -> remove(deliveryId, emitter));
        emitter.onError((e) -> remove(deliveryId, emitter));

        return emitter;
    }

    public void publish(TrackingEvent ev) {
        Set<SseEmitter> set = emitters.getOrDefault(ev.getDelivery().getId(), Collections.emptySet());
        List<SseEmitter> dead = new ArrayList<>();

        for (SseEmitter em : set) {
            try {
                em.send(SseEmitter.event().name("tracking").data(ev));
            } catch (IOException e) {
                dead.add(em);
            }
        }

        set.removeAll(dead);
    }

    private void remove(Long id, SseEmitter em) {
        Set<SseEmitter> set = emitters.get(id);
        if (set != null) set.remove(em);
    }
}
