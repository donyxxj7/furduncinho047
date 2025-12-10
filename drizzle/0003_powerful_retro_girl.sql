CREATE TABLE `event_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventDate` varchar(100) DEFAULT 'A definir',
	`eventTime` varchar(100) DEFAULT 'A partir das 14h',
	`eventLocation` varchar(255) DEFAULT 'Local a definir',
	`eventDescription` text,
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_settings_id` PRIMARY KEY(`id`)
);
