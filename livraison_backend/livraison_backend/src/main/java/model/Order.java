package com.example.livraison_backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="orders")
public class Order {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

  @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name="pickup_address_id")
  private Address pickupAddress;

  @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name="dropoff_address_id")
  private Address dropoffAddress;

  private Instant createdAt = Instant.now();

  @Enumerated(EnumType.STRING)
  private DeliveryStatus status = DeliveryStatus.CREATED;

  public Long getId(){return id;} public void setId(Long id){this.id=id;}
  public Address getPickupAddress(){return pickupAddress;} public void setPickupAddress(Address a){this.pickupAddress=a;}
  public Address getDropoffAddress(){return dropoffAddress;} public void setDropoffAddress(Address a){this.dropoffAddress=a;}
  public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant t){this.createdAt=t;}
  public DeliveryStatus getStatus(){return status;} public void setStatus(DeliveryStatus s){this.status=s;}
}
