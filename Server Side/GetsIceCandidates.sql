USE [yokd_db]
GO

/****** Object:  StoredProcedure [dbo].[getVirtualBookingIceCandidates]    Script Date: 2022-02-19 7:16:02 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO














-- =============================================
-- Author:		Tyler Farkas
-- Create date: 2021-05-30
-- Description:	gets ice candidates for WebRTC
-- =============================================
CREATE PROCEDURE [dbo].[getVirtualBookingIceCandidates]
	-- Add the parameters for the stored procedure here
	@token varchar(70),
	@bookId as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @accountId  as varchar(65)

	select top 1 @accountId=accountId from Account where accountToken=@token and type <>'System'

	IF NULLIF(@accountId, '') IS NOT NULL
	BEGIN
		select * from VirtualBookingIceCandidates where bookId=@bookId and accountId != @accountId and [read]=0
		update VirtualBookingIceCandidates
		set [read]=1
		where bookId=@bookId and accountId != @accountId and [read]=0
	END
	ELSE
	BEGIN
	select  'Invalid Token, please try again.'
	END
	END
GO


