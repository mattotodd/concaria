DROP TABLE IF EXISTS inventory, firmware, application_config, rules;

CREATE TABLE inventory
(
  id serial NOT NULL,
  serial character(13),
  "soldDate" timestamp without time zone,
  "soldTo" text,
  sold boolean DEFAULT false,
  reserved boolean DEFAULT false,
  CONSTRAINT inventory_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE firmware
(
  id integer NOT NULL,
  serial character(13),
  "mqttUser" character(36),
  "mqttPassword" character(44),
  "associationCode" text,
  "organizationId" character(36),
  "deviceId" character(36),
  CONSTRAINT firmware_pkey PRIMARY KEY (id),
  CONSTRAINT firmware_id_fkey FOREIGN KEY (id)
      REFERENCES inventory (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);

CREATE TABLE rules
(
  id serial NOT NULL,
  "ruleConfig" json
)
WITH (
  OIDS = FALSE
);

CREATE TABLE application_config
(
  id serial NOT NULL,
  "accountId" text,
  "organization" json,
  "mqttUser" json,
  "device" json,
  "endUser" json
)
WITH (
  OIDS = FALSE
);
