USE [yokd_db]
GO

/****** Object:  StoredProcedure [dbo].[checkOffer]    Script Date: 2022-02-19 6:54:55 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO








































-- =============================================
-- Author:		Tyler Farkas
-- Create date: 2019-07-30
-- Description:	Sets the offer.
-- Updated With Token: 2019-08-09
-- =============================================
CREATE PROCEDURE [dbo].[checkOffer]
	-- Add the parameters for the stored procedure here
	@token varchar(70),
	@offer varchar(max),
	@bookId int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @accountId int
	declare @offerExist varchar(max)
	declare @needsReset as bit
	declare @isTrainer as int
	set @isTrainer = 0

	select @accountId=accountId from Account where accountToken=@token
	--Social Load Case:
	IF NULLIF(@accountId, '') IS NOT NULL
	BEGIN
			select @isTrainer=accountId from PersonalTrainer where accountId=@accountId
			select @offerExist=offer from VirtualBooking where bookId=@bookId
			select 
			@needsReset=CASE 
				WHEN answer is not null THEN 1 
				WHEN ready is not null THEN 1 
				 ELSE 0	
			 END
			 from VirtualBooking where bookId=@bookId

				 IF @needsReset=1
				 begin
				 set @offerExist=''
					update VirtualBooking
					set offer=null,answer=null,ready=null
					where bookId=@bookId
				 end

				IF NULLIF(@offerExist, '') IS NOT NULL AND @isTrainer = 0
				BEGIN
					select @offerExist as SetOffer
				END
				ELSE
				begin
					update VirtualBooking
					set offer=@offer
					where bookId=@bookId
					select 'Set Offer' as SetOffer
				END
	END
	ELSE
			select 'Invalid Token, Please try again.'
	END

GO


