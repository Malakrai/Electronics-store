package com.example.livraison_backend.model;

import jakarta.persistence.*;

@Entity
public class Address {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  private String line1; private String line2; private String city; private String zip; private String country;
  private Double lat; private Double lng;

  public Long getId(){return id;} public void setId(Long id){this.id=id;}
  public String getLine1(){return line1;} public void setLine1(String v){this.line1=v;}
  public String getLine2(){return line2;} public void setLine2(String v){this.line2=v;}
  public String getCity(){return city;} public void setCity(String v){this.city=v;}
  public String getZip(){return zip;} public void setZip(String v){this.zip=v;}
  public String getCountry(){return country;} public void setCountry(String v){this.country=v;}
  public Double getLat(){return lat;} public void setLat(Double v){this.lat=v;}
  public Double getLng(){return lng;} public void setLng(Double v){this.lng=v;}
}
