-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema blog_viajes
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema blog_viajes
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `blog_viajes` ;
USE `blog_viajes` ;

-- -----------------------------------------------------
-- Table `blog_viajes`.`autores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `blog_viajes`.`autores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(45) NOT NULL,
  `contrasena` VARCHAR(45) NOT NULL,
  `pseudonimo` VARCHAR(45) NOT NULL,
  `avatar` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `blog_viajes`.`publicaciones`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `blog_viajes`.`publicaciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(45) NOT NULL,
  `resumen` VARCHAR(255) NOT NULL,
  `contenido` VARCHAR(255) NOT NULL,
  `foto` VARCHAR(255) NULL,
  `votos` INT NULL DEFAULT 0,
  `fecha_hora` TIMESTAMP(6) NULL,
  `autor_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_publicaciones_autores_idx` (`autor_id` ASC),
  CONSTRAINT `fk_publicaciones_autores`
    FOREIGN KEY (`autor_id`)
    REFERENCES `blog_viajes`.`autores` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

---

INSERT INTO `blog_viajes`.`autores` (`email`, `contrasena`, `pseudonimo`) VALUES ('luis@email.com', '123456', 'luisalejandro');
INSERT INTO `blog_viajes`.`autores` (`email`, `contrasena`, `pseudonimo`) VALUES ('ana@email.com', '123456', 'ana2000');
INSERT INTO `blog_viajes`.`autores` (`email`, `contrasena`, `pseudonimo`) VALUES ('zeus@email.com', '123456', 'teto');

---

INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('Roma', 'Buen viaje a Roma', 'Contenido', '2021-01-07 00:00:00.000000', '0', '1');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('Grecia', 'Buen viaje a Grecia', 'Contenido', '2021-01-07 00:00:00.000000', '0', '1');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('Paris', 'Buen viaje a Paris', 'Contenido', '2021-01-07 00:00:00.000000', '0', '1');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('Colombia', 'Buen viaje a Colombia', '2021-01-07 00:00:00.000000', 'Contenido', '0', '1');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('China', 'Buen viaje a China', 'Contenido', '2021-01-07 00:00:00.000000', '0', '2');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('Argenitna', 'Buen viaje a Argenitina', 'Contenido', '2021-01-07 00:00:00.000000', '0', '2');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('Peru', 'Buen viaje a Peru', 'Contenido', '2021-01-07 00:00:00.000000', '0', '2');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `autor_id`) VALUES ('Chile', 'Buen viaje a Chile', 'Contenido', '2021-01-07 00:00:00.000000', '1');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('Rusia', 'Buen viaje a Rusia', 'Contenido', '2021-01-07 00:00:00.000000', '0', '3');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `votos`, `autor_id`) VALUES ('Pitalito', 'Buen viaje a Pitalito', 'Contenido', '2021-01-07 00:00:00.000000', '0', '3');
INSERT INTO `blog_viajes`.`publicaciones` (`titulo`, `resumen`, `contenido`, `fecha_hora`, `autor_id`) VALUES ('Amsterdam', 'Buen viaje a Amsterdam', 'Contenido', '2021-01-07 00:00:00.000000', '3');
