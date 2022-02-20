USE [yokd_db]
GO

/****** Object:  StoredProcedure [dbo].[addVirtualBookingIceCandidates]    Script Date: 2022-02-19 7:13:35 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO














-- =============================================
-- Author:		Tyler Farkas
-- Create date: 2021-05-30
-- Description:	gets ice candidates for WebRTC
-- =============================================
CREATE PROCEDURE [dbo].[addVirtualBookingIceCandidates]
	-- Add the parameters for the stored procedure here
	@token varchar(70),
	@bookId as int,
	@candidate as varchar(max)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @accountId  as varchar(65)

	select top 1 @accountId=accountId from Account where accountToken=@token and type <>'System'

	IF NULLIF(@accountId, '') IS NOT NULL
	BEGIN
		insert into VirtualBookingIceCandidates values (@bookId,@accountId,@candidate,0)
		select 'Inserted Key'
	END
	ELSE
	BEGIN
	select  'Invalid Token, please try again.'
	END
	END
GO


