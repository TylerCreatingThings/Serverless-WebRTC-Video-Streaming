USE [yokd_db]
GO

/****** Object:  StoredProcedure [dbo].[checkIfOfferExists]    Script Date: 2022-02-19 6:52:56 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO








































-- =============================================
-- Author:		Tyler Farkas
-- Create date: 2019-07-30
-- Description:	Checks if the other person gave an offer yet.
-- Updated With Token: 2019-08-09
-- =============================================
CREATE PROCEDURE [dbo].[checkIfOfferExists]
	-- Add the parameters for the stored procedure here
	@token varchar(70),
	@bookId int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @accountId int
	declare @offerExist varchar(max)
	declare @needsReset as bit
	declare @isSocialVirtual as int

	select @accountId=accountId from Account where accountToken=@token
	select @isSocialVirtual=bookId from Bookings where bookId=@bookId and bookingType='client'
	--Social Load Case:
	IF NULLIF(@accountId, '') IS NOT NULL
	BEGIN
			IF NULLIF(@isSocialVirtual, '') IS NOT NULL
			BEGIN
				select 'Social'
			END
			ELSE
			BEGIN
			select offer from VirtualBooking where bookId=@bookId and answer is null and ready is null
			END
	END
	ELSE
			select 'Invalid Token, Please try again.'
	END

GO


