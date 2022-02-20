USE [yokd_db]
GO

/****** Object:  StoredProcedure [dbo].[checkReady]    Script Date: 2022-02-19 7:01:39 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO








































-- =============================================
-- Author:		Tyler Farkas
-- Create date: 2019-07-30
-- Description:	Sets the video to be ready
-- Updated With Token: 2019-08-09
-- =============================================
CREATE PROCEDURE [dbo].[checkReady]
	-- Add the parameters for the stored procedure here
	@token varchar(70),
	@ready bit,
	@bookId int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @accountId int
	declare @readyExist varchar(max)

	select @accountId=accountId from Account where accountToken=@token

	IF NULLIF(@accountId, '') IS NOT NULL
	BEGIN
			select @readyExist=ready from VirtualBooking where bookId=@bookId
			IF @ready = 1
			BEGIN
				update VirtualBooking
				set ready=@ready
				where bookId=@bookId
				select 'Set Ready' as SetReady
			END
			ELSE IF @readyExist = 1
			BEGIN
				select 'Ready' as SetReady
			END
			ELSE
			begin
				select 'Not Ready' as SetReady
			END
	END
	ELSE
			select 'Invalid Token, Please try again.'
	END

GO


